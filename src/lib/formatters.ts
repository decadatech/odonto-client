export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, "")
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "")
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}
