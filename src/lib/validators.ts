import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'メールアドレスを入力してください')
  .email('有効なメールアドレスを入力してください');

export const passwordSchema = z
  .string()
  .min(6, 'パスワードは6文字以上で入力してください');

export const captionSchema = z
  .string()
  .max(200, 'キャプションは200文字以内で入力してください')
  .optional()
  .or(z.literal(''));

export const inviteCodeSchema = z
  .string()
  .min(1, '招待コードを入力してください')
  .regex(/^[A-Za-z0-9]{6}$/, '招待コードは英数字6桁です');

export const commentBodySchema = z
  .string()
  .min(1, 'コメントを入力してください')
  .max(200, 'コメントは200文字以内で入力してください');

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'パスワード確認を入力してください'),
    displayName: z.string().min(1, '表示名を入力してください').max(50, '表示名は50文字以内で入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

export const profileEditSchema = z.object({
  displayName: z.string().min(1, '表示名を入力してください').max(50, '表示名は50文字以内で入力してください'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type ProfileEditValues = z.infer<typeof profileEditSchema>;
