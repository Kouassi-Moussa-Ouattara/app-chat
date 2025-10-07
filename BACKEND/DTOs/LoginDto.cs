using System;

namespace BACKEND.DTOs;

public class LoginDtos
{
    required
    public string Email
    { get; set; } = string.Empty;
    required
    public string Password
    { get; set; } = string.Empty;
}
