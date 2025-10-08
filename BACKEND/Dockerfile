# Étape 1 : Build avec le SDK .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copier uniquement le backend
COPY BACKEND/ .
RUN dotnet publish -c Release -o out

# Étape 2 : Runtime léger
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

# Lancer l'application
ENTRYPOINT ["dotnet", "Chat.dll"]
