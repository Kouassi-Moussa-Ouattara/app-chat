# -----------------------------
# Étape 1 : Build backend
# -----------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copier le fichier .csproj et restaurer les dépendances
COPY BACKEND/*.csproj ./BACKEND/
WORKDIR /src/BACKEND
RUN dotnet restore

# Copier tout le backend et publier
COPY BACKEND/ ./
RUN dotnet publish -c Release -o /app/publish

# -----------------------------
# Étape 2 : Build frontend Angular
# -----------------------------
FROM node:22 AS frontend
WORKDIR /app/frontend

# Copier les fichiers frontend et installer les dépendances
COPY FRONTEND/ ./
RUN npm install
RUN npm run build --prod

# -----------------------------
# Étape 3 : Runtime .NET
# -----------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copier le backend publié
COPY --from=build /app/publish .

# Copier le frontend compilé dans wwwroot
COPY --from=frontend /app/frontend/dist /app/wwwroot

COPY ./dist /app/wwwroot


# Exposer le port dynamique Render
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE 5000

# Démarrer l'application
ENTRYPOINT ["dotnet", "BACKEND.dll"]
