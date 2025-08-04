using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

public class OtpService
{
    private readonly IConfiguration _config;
    public OtpService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<bool> SendOtp(string phoneNumber, string otp)
    {
        var accountSid = _config["Twilio:AccountSID"];
        var authToken = _config["Twilio:AuthToken"];
        TwilioClient.Init(accountSid, authToken);

        var message = await MessageResource.CreateAsync(
            body: $"Your OTP is {otp}",
            from: new PhoneNumber(_config["Twilio:PhoneNumber"]),
            to: new PhoneNumber(phoneNumber)
        );

        return message.ErrorCode == null;
    }
} 