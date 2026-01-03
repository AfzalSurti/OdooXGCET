// Service to handle n8n webhook integration and webhook.site verification code fetching
const N8N_WEBHOOK_URL = 'https://lala123.app.n8n.cloud/webhook/signup-verification';
const WEBHOOK_SITE_TOKEN = '09147d97-f125-4796-bb9c-c8c2778c0160';
const WEBHOOK_SITE_API_URL = `https://webhook.site/token/${WEBHOOK_SITE_TOKEN}/requests`;

export const n8nService = {
  /**
   * Send email to n8n webhook for verification
   * n8n will send verification code to webhook.site
   */
  async sendEmailToN8N(email: string): Promise<boolean> {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('N8N response:', data);
      return true;
    } catch (error) {
      console.error('Error sending email to n8n:', error);
      throw error;
    }
  },

  /**
   * Fetch verification code from webhook.site
   * Polls the webhook.site API to get the latest verification code
   */
  async getVerificationCodeFromWebhookSite(email: string, maxRetries: number = 10, delayMs: number = 500): Promise<string | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Fetching from webhook.site (attempt ${attempt + 1}/${maxRetries})...`);
        const response = await fetch(`${WEBHOOK_SITE_API_URL}?sort=desc&limit=50`);

        if (!response.ok) {
          throw new Error(`Webhook.site API failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Webhook.site response:', data);

        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from webhook.site');
        }

        // Find the most recent request for this email
        for (const request of data.data) {
          try {
            // The content field is a JSON string that needs to be parsed
            let bodyContent: string = '';
            
            if (typeof request.content === 'string') {
              bodyContent = request.content;
            } else if (request.content === null || request.content === '') {
              continue; // Skip empty content
            } else {
              bodyContent = JSON.stringify(request.content);
            }

            // Parse the JSON content
            const body = JSON.parse(bodyContent);

            console.log('Parsed request body:', body);

            // Check if this request matches the email and has verification code
            if (body.email && body.email.toLowerCase() === email.toLowerCase() && body.verificationCode) {
              console.log('Found verification code:', body.verificationCode);
              return body.verificationCode.toString();
            }
          } catch (e) {
            // Skip requests that can't be parsed
            console.warn('Could not parse request content:', e);
            continue;
          }
        }

        // If not found, wait and retry
        if (attempt < maxRetries - 1) {
          console.log(`Verification code not found, retrying in ${delayMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('Could not fetch verification code from webhook.site after all retries');
  },

  /**
   * Verify user-entered code against fetched code from webhook.site
   */
  async verifyCode(email: string, userEnteredCode: string): Promise<boolean> {
    try {
      const webhookCode = await this.getVerificationCodeFromWebhookSite(email);

      if (!webhookCode) {
        throw new Error('Could not retrieve verification code');
      }

      // Compare codes
      const codeMatch = webhookCode.trim() === userEnteredCode.trim();

      if (!codeMatch) {
        throw new Error('Verification code does not match');
      }

      return true;
    } catch (error) {
      console.error('Code verification failed:', error);
      throw error;
    }
  },
};
