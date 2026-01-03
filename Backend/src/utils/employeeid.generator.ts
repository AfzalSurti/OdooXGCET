import { prisma } from '../lib/prisma.js';


export async function generateEmployeeId(
  companyName: string,
  firstName: string,
  lastName: string,
  joiningYear: number
): Promise<string> {
  const companyCode = companyName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');

  const firstNamePart = firstName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');
  
  const lastNamePart = lastName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');

  const nameCode = firstNamePart + lastNamePart;


  const basePattern = `${companyCode}${nameCode}${joiningYear}`;


  const existingEmployees = await prisma.user.findMany({
    where: {
      employeeId: {
        startsWith: basePattern
      },
      joiningYear: joiningYear
    },
    orderBy: {
      employeeId: 'desc'
    },
    take: 1
  });

  let serialNumber = 1;

  if (existingEmployees.length > 0) {

    const lastEmployeeId = existingEmployees[0]!.employeeId;
    const lastSerial = parseInt(lastEmployeeId.slice(-4), 10);
    serialNumber = lastSerial + 1;
  }

  const serialStr = serialNumber.toString().padStart(4, '0');

  return `${basePattern}${serialStr}`;
}

export function generateRandomPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math. random() * allChars.length)];
  }
  

  return password.split('').sort(() => Math.random() - 0.5).join('');
}