# Étape 1 : build backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY BACKEND/*.csproj ./BACKEND/
WORKDIR /src/BACKEND
RUN dotnet restore
COPY BACKEND/ ./
RUN dotnet publish -c Release -o /app/publish

# Étape 2 : build frontend Angular
FROM node:22 AS frontend
WORKDIR /app/frontend
COPY FRONTEND/ ./
RUN npm install
RUN npm run build

# Étape 3 : image runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
COPY --from=frontend /app/frontend/dist /app/wwwroot
EXPOSE $PORT
ENV ASPNETCORE_URLS=http://*:$PORT
ENTRYPOINT ["dotnet", "BACKEND.dll"]
