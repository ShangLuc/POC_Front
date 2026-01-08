
## Terminal Commands

1. Install NodeJs from [NodeJs Official Page](https://nodejs.org/en).
2. Open Terminal
3. Go to your file project
4. Run in terminal: ```npm install -g @angular/cli```
5. Then: ```npm install```
6. Then: ```npm install @ng-select/ng-select```
7. And: ```ng serve```
8. Navigate to: [http://localhost:4200/](http://localhost:4200/)

## L'installation sur Debian 12 dans une VM Proxmox, sans dépendre de Docker pour limiter les problémes avec le proxy et l'architecture Univ

1.Contexte et cible:
1 VM Debian 12 sur Proxmox,avec:
    - 2 vCPU
    - 4 Go RAM
    - 40 Go Disque
pas de docker
Backend:Springboot avec MySQL local
Frontend:Angular 
2.Pré-requis système:
Sur la VM, en root ou avec sudo:
    - apt update
    - apt full-upgrade -y
    -reboot
Après redémarrage:
    - apt update
    - apt install -y curl git ca-certificates 

3.installation MySQL (ou MariaDB) et base FESUP: 
Debian 12 fournit MariaDB, compatible avec votre driver MySQL.
    -apt install -y mariadb-server mariadb-client
    -systemctl enable mariadb
    -systemctl start mariadb
Sécurisation de base :
    -mysql_secure_installation
Puis créer la base et l’utilisateur EXACTEMENT comme dans application.properties :
    -mysql -u root -p
Dans le client MySQL:
    CREATE DATABASE pocdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    CREATE USER 'pocuser'@'localhost' IDENTIFIED BY 'pocpassword';

    GRANT ALL PRIVILEGES ON pocdb.* TO 'pocuser'@'localhost';

    FLUSH PRIVILEGES;
    EXIT;

4.Installation Java 17 et Maven (pour builder et lancer Spring Boot):
Votre pom.xml indique Java 17:
    -apt install -y openjdk-17-jdk maven
    -java -version (renvoie bien une version 17)
    -mvn -version 

5.Récupération du projet sur la VM:
Place le code dans /opt/Projet_POC par exemple:
    -mkdir -p /opt/Projet_POC
    -cd /opt/Projet_POC
    -git clone <votre_repo_git> .
A la fin, on doit avoir:
/opt/Projet_POC
    ├── poc_back
    └── poc_front
6.Build et lancement du backend Spring Boot:
Depuis /opt/Projet_POC/poc_back:
    -mvn clean package -DskipTests
Maven télécharge les dépendances (Spring Boot, MySQL, etc.). Le jar final se trouve dans target/, par exemple :
target/springboot-mysql-docker-0.0.1-SNAPSHOT.jar
Test de lancement manuel :
    -cd /opt/Projet_POC/poc_back
    -java -jar target/springboot-mysql-docker-0.0.1-SNAPSHOT.jar

Vérification depuis la VM:
    -curl http://localhost:8080/actuator/health || true

7.Service systemd 

    


