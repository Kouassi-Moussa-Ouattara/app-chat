# Étape 1 : build du frontend Angular
FROM node:22 AS frontend
WORKDIR /app/frontend
COPY FRONTEND/ .
RUN npm install
RUN npm run build --prod

# Étape 2 : build du backend .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copier le backend depuis la racine
COPY *.csproj ./
COPY *.sln ./
COPY . ./

RUN dotnet restore Chat.sln
RUN dotnet publish Chat.csproj -c Release -o /app/publish

# Étape 3 : image runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copier les fichiers du backend
COPY --from=build /app/publish .

# Copier le frontend Angular dans wwwroot
COPY --from=frontend /app/frontend/dist /app/wwwroot

# Configurer le port Render
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE 8080

ENTRYPOINT ["dotnet", "Chat.dll"]
