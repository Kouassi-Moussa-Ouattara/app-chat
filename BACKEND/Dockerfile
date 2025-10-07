# ------------------------
# Étape 1 : Build avec le SDK .NET 9
# ------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Publier le projet en Release dans le dossier /out
RUN dotnet publish -c Release -o out

# ------------------------
# Étape 2 : Runtime léger pour exécuter l'application
# ------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copier les fichiers buildés depuis l'étape précédente
COPY --from=build /app/out .

# Définir la commande de démarrage
ENTRYPOINT ["dotnet", "Chat.dll"]
