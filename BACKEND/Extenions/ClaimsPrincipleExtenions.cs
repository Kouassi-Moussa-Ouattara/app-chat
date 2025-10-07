using System;
using System.Security.Claims;

namespace BACKEND.Extenions;

public static class ClaimsPrincipleExtenions
{
    public static string GetUserName(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Name) ??
        throw new Exception("Impossible d'obtenir le nom !");
    }

    public static Guid GetUserId(this ClaimsPrincipal user)
    {
       return Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? 
       throw new Exception("Impossible d'obtenir l'identifiant !"));
     } 
}
