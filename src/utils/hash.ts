import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(8);
export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, salt);

export const checkPassword = async (
  password: string,
  hash: string
): Promise<boolean> => bcrypt.compare(password, hash);
