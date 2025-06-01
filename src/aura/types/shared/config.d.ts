type AES256EncryptedConfig = string;
type Base64String = string;

interface EncryptedConfig {
  content: AES256EncryptedConfig;
  authTag: Base64String;
  salt: Base64String;
  iv: Base64String;
}
