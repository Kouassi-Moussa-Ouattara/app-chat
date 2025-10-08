# Étape 1 : Build du frontend Angular
FROM node:22 AS frontend
WORKDIR /app/frontend
COPY FRONTEND/ .
RUN npm install
RUN npm run build --prod

# Étape 2 : Build du backend .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY BACKEND/ ./BACKEND/
COPY Chat.sln .
RUN dotnet restore Chat.sln
RUN dotnet publish BACKEND/BACKEND.csproj -c Release -o /app/out

# Étape 3 : Image finale
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
COPY --from=frontend /app/frontend/dist /app/wwwroot

ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE 8080

ENTRYPOINT ["dotnet", "BACKEND.dll"]
