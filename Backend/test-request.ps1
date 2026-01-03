$json = @{
    employeeId = "EMP001"
    email = "user@example.com"
    password = "SecurePass123!"
    companyName = "Tech Corp"
    phoneNumber = "+1234567890"
    role = "EMPLOYEE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $json -ContentType "application/json"
