using System;
using BACKEND.Common;
using BACKEND.DTOs;
using BACKEND.Extenions;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;


namespace BACKEND.Endpoints;

public static class AccountEndpoint
{
    public static RouteGroupBuilder MapAccountEndpoint(this WebApplication app)
    {
        var group = app.MapGroup("/api/account").WithTags("account");
        _ = group.MapPost("/register", static async (HttpContext context, UserManager<AppUser> userManager,
        [FromForm] string fullname, [FromForm] string username, [FromForm] string email,
        [FromForm] IFormFile? profileImage, [FromForm] string password) =>
        {
            var userFromDb = await userManager.FindByEmailAsync(email);
            if (userFromDb is not null)
            {
                return Results.BadRequest(Response<string>.Failure("Cet utilisateur existe déjà !"));
            }

            if (profileImage is null)
            {
                return Results.BadRequest(Response<string>.Failure("Ce champs est obligatoire"));
            }
            var picture = await FileUpload.Upload(profileImage);

            picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

            var user = new AppUser
            {
                Email = email,
                FullName = fullname,
                UserName = username,
                ProfileImage = picture
            };
            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Failure
                (result.Errors.Select(static x => x.Description).FirstOrDefault()!));
            }
            return Results.Ok(Response<string>.Success("", "Utilisateur créé avec succès !"));
        }).DisableAntiforgery();


        group.MapPost("/login", async (UserManager<AppUser> userManager,
        TokenService tokenService, LoginDtos dto) =>
        {
            if (dto is null)
            {
                return Results.BadRequest(Response<string>.Failure("Votre login n'est pas valide !"));
            }

            var user = await userManager.FindByEmailAsync(dto.Email);

            if (user is null)
            {
                return Results.BadRequest(Response<string>.Failure("Email et mot de passe intruvables, veuillez créer un compte svp !"));
            }

            var result = await userManager.CheckPasswordAsync(user!, dto.Password);

            if (!result)
            {
                return Results.BadRequest(Response<string>.Failure("Mot de passe incorrecte !"));
            }

            var token = tokenService.GenerateToken(user.Id, user.UserName!);

            return Results.Ok(Response<string>.Success(token, "Soyez la Bienvenue !"));
        });

        group.MapGet("/me", async (HttpContext context, UserManager<AppUser> userManager) =>
        {
            var currentLoggedInUserId = context.User.GetUserId();
            var currentLoggedInUser = await userManager.Users.SingleOrDefaultAsync(x => x.Id == currentLoggedInUserId.ToString());
            return Results.Ok(Response<AppUser>.Success(currentLoggedInUser!, "Utilisateur recupéré avec succès !"));
        });
        return group;
    }
}
