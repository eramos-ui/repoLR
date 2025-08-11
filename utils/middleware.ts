import { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage, ServerResponse } from "http";

export const runMiddleware = (
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse,
  fn: Function
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};
