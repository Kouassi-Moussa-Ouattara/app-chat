# Étape 1 : build du frontend Angular
FROM node:22 AS frontend
WORKDIR /app/frontend
COPY FRONTEND/ .
RUN npm install
RUN npm run build --prod

# Étape 2 : build du backend .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY BACKEND/*.csproj ./BACKEND/
WORKDIR /src/BACKEND
RUN dotnet restore
COPY BACKEND/ ./            
RUN dotnet publish -c Release -o /app/publish

# Étape 3 : image finale (runtime)
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copie le backend compilé
COPY --from=build /app/publish .

# Copie le frontend Angular dans wwwroot
COPY --from=frontend /app/frontend/dist /app/wwwroot

# Configuration Render
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE 5000

ENTRYPOINT ["dotnet", "BACKEND.dll"]
