using System;

namespace BACKEND.DTOs;

public class MessageRequestDto
{
    public int Id { get; set; }
    public string? SenderId { get; set; }
    public string? ReceiverId { get; set; }
    public string? Content { get; set; }
    public string? ISRead { get; set; }
    public DateTime CreateDate { get; set; }
}
