<p class="kicker">Partie 2 · Protéger ses comptes</p>

# Double authentification (MFA)

_Des techniques relativement simples permette quand même de mettre la main sur vos mots de passes !_
_Exemple: fuites de données, ré-initialisation de mot de passe, etc..._

## Qu'est-ce c'est ?

> - Le **MFA** et **2FA** permet d'être sécurisé contre ce genre de contournement.  
>   - _MFA: Multi-Factor Authentication, 2FA: Two-Factor Authentication._  
> - Un **2ᵉ facteur** en plus du mot de passe: 
>   - _Même avec un mot de passe volé, l'attaquant est confronté à une seconde étape._


## Les méthodes, de la moins à la plus sûre

- _SMS (pratique mais peu fiable)._
- _Application d'authentification TOTP (Time-based One Time Password): Google Auth, Microsoft MFA._
- _Clé physique (FIDO2 / passkeys - TouchId, FaceId): le plus sûr !_

## Bonnes pratiques

> - Activer le MFA sur les comptes **critiques**: email, banque, assurances, gestionnaire de mot de passe, services du gouvernement.  
> - Préférez les moyens physiques (TouchID, FaceId) quand c'est possible.  
> - Conserver les **codes de secours** afin de pouvoir réinitialiser en cas de besoin (changement d'appareil, etc...).  
