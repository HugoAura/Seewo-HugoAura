type AES256EncryptedConfig = string;
type Base64String = string;
type SHA256EncryptedPassword = string;

interface EncryptedConfig {
  content: AES256EncryptedConfig;
  authTag: Base64String;
  salt: Base64String;
  iv: Base64String;
}

type AuraConfig = Record<any, any>;
