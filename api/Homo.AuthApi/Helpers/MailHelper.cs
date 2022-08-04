using System;
using System.Threading.Tasks;
using System.Net;
using System.Collections.Generic;
using SendGrid;
using SendGrid.Helpers.Mail;
using Amazon;
using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;

namespace Homo.AuthApi
{
    public enum MailProvider
    {
        SEND_GRID,
        AWS_SES,
        MAILCHIMP // without implement
    }

    public class MailHelper
    {
        public static async Task<dynamic> Send(MailProvider provider, MailTemplate template, string fromMail, string toMail, string sendGridAPIKey)
        {
            dynamic bodyObj = null;
            if (provider == MailProvider.SEND_GRID)
            {
                var client = new SendGridClient(sendGridAPIKey);
                var from = new EmailAddress(fromMail);
                var to = new EmailAddress(toMail);
                var msg = SendGrid.Helpers.Mail.MailHelper.CreateSingleEmail(from, to, template.Subject, "", template.Content);
                var response = await client.SendEmailAsync(msg);
                var body = await response.Body.ReadAsStringAsync();
                if (response.StatusCode != HttpStatusCode.OK && body.Length > 0)
                {
                    bodyObj = Newtonsoft.Json.JsonConvert.DeserializeObject(body);
                    if (bodyObj.errors != null)
                    {
                        throw new Exception(bodyObj.errors[0].message.ToString());
                    }
                }
            }
            else
            {
                using (var client = new AmazonSimpleEmailServiceV2Client(RegionEndpoint.APNortheast1))
                {
                    var sendRequest = new SendEmailRequest
                    {
                        FromEmailAddress = fromMail,
                        Destination = new Destination
                        {
                            ToAddresses =
                            new List<string> { toMail }
                        },
                        Content = new EmailContent
                        {
                            Simple = new Message()
                            {
                                Subject = new Amazon.SimpleEmailV2.Model.Content()
                                {
                                    Data = template.Subject
                                },
                                Body = new Body
                                {
                                    Html = new Amazon.SimpleEmailV2.Model.Content
                                    {
                                        Charset = "UTF-8",
                                        Data = template.Content
                                    },
                                    Text = new Amazon.SimpleEmailV2.Model.Content
                                    {
                                        Charset = "UTF-8",
                                        Data = template.Content
                                    }
                                }
                            }
                        }

                    };
                    Console.WriteLine("Sending email using Amazon SES...");
                    SendEmailResponse response = await client.SendEmailAsync(sendRequest);
                    bodyObj = response.ResponseMetadata;
                    Console.WriteLine("The email was sent successfully.");

                }

            }
            return bodyObj;
        }
    }

}