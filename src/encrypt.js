import { enginee } from "../server";

export async function encrypteR(obj) {
  return enginee.encrypt(obj, 5000); // generated string will live 5 seconds
}

export async function decrypteR(hex) {
  return enginee.decrypt(hex);
}
