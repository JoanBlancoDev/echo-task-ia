import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

export const EMAIL_INVALID_MESSAGE = "Email inválido";
export const PASSWORD_MIN_MESSAGE = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
export const PASSWORD_MAX_MESSAGE = `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`;
export const PASSWORD_PATTERN_MESSAGE =
  "Debe incluir mayúscula, minúscula, número y carácter especial";

export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`
);

export const PASSWORD_REQUIREMENTS = [
  `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  `Máximo ${PASSWORD_MAX_LENGTH} caracteres`,
  "Una letra mayúscula",
  "Una letra minúscula",
  "Un número",
  "Un carácter especial",
] as const;

export const emailSchema = () => z.string().trim().email(EMAIL_INVALID_MESSAGE);

export const passwordSchema = () =>
  z
    .string()
    .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE)
    .max(PASSWORD_MAX_LENGTH, PASSWORD_MAX_MESSAGE)
    .regex(PASSWORD_REGEX, PASSWORD_PATTERN_MESSAGE);
