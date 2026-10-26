export type ContactFields = { name: string; email: string; phone: string; subject: string; message: string; consent: boolean; website: string };
export const emptyContact: ContactFields = { name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' };
export function validateContact(value: unknown): { data: ContactFields; errors: Record<string, string> } {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const text = (key: string) => typeof input[key] === 'string' ? input[key].trim() : '';
  const data: ContactFields = { name: text('name'), email: text('email'), phone: text('phone'), subject: text('subject'), message: text('message'), website: text('website'), consent: input.consent === true };
  const errors: Record<string, string> = {};
  if (data.name.length < 2 || data.name.length > 120) errors.name = 'მიუთითეთ სახელი და გვარი (2–120 სიმბოლო).';
  if (data.email.length > 254 || /[^\x21-\x7e]/.test(data.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'მიუთითეთ სწორი ელფოსტის მისამართი.';
  if (data.phone && !/^[+\d\s().-]{5,40}$/.test(data.phone)) errors.phone = 'შეამოწმეთ ტელეფონის ნომერი.';
  if (!data.subject || data.subject.length > 200 || /[\x00-\x1f\x7f]/.test(data.subject)) errors.subject = 'მიუთითეთ თემა (მაქსიმუმ 200 სიმბოლო).';
  if (data.message.length < 10 || data.message.length > 5000) errors.message = 'შეტყობინება უნდა შეიცავდეს 10–5000 სიმბოლოს.';
  if (!data.consent) errors.consent = 'გთხოვთ, დაეთანხმოთ საკონტაქტო მონაცემების დამუშავებას.';
  return { data, errors };
}
