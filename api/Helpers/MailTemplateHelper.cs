using System.IO;
using System.Reflection;
using System.Collections.Generic;

namespace Homo.AuthApi
{
    public class MailTemplateHelper
    {
        public static MailTemplate Get(MAIL_TEMPLATE key, string staticPath)
        {
            string filePath = "";
            string subject = "";
            if (key == MAIL_TEMPLATE.VERIFY_EMAIL)
            {
                filePath = $"{staticPath}/email/verify-email.html";
                subject = "mailSubjectVerifyEmail";
            }
            else if (key == MAIL_TEMPLATE.TWO_FACTOR_AUTH)
            {
                filePath = $"{staticPath}/email/two-factor-auth.html";
                subject = "mailSubjectTwoFactorAuth";
            }
            else if (key == MAIL_TEMPLATE.RESET_PASSWORD)
            {
                filePath = $"{staticPath}/email/reset-password.html";
                subject = "mailSubjectResetPasword";
            }
            else if (key == MAIL_TEMPLATE.OVER_SUBSCRIPTION)
            {
                filePath = $"{staticPath}/email/over-subscription.html";
                subject = "mailSubjectOverPlan";
            }
            else if (key == MAIL_TEMPLATE.CONTACT_US)
            {
                filePath = $"{staticPath}/email/contact-us.html";
                subject = "mailSubjectContactUs";
            }
            else if (key == MAIL_TEMPLATE.EARLY_BIRD_REGISTER)
            {
                filePath = $"{staticPath}/email/early-bird-register.html";
                subject = "mailSubjectEarlyBirdRegister";
            }
            else if (key == MAIL_TEMPLATE.NEW_PREIUM_USER)
            {
                filePath = $"{staticPath}/email/new-premium-user.html";
                subject = "mailSubjectGetNewPremiumUser";
            }
            else if (key == MAIL_TEMPLATE.TRIGGER_NOTIFICATION)
            {
                filePath = $"{staticPath}/email/trigger-notification.html";
                subject = "triggerNotification";
            }
            else if (key == MAIL_TEMPLATE.SURVEY)
            {
                filePath = $"{staticPath}/email/survey.html";
                subject = "mailSubjectSurvey";
            }
            else if (key == MAIL_TEMPLATE.INVITE)
            {
                filePath = $"{staticPath}/email/invite.html";
            }

            string content = File.ReadAllText(filePath);
            return new MailTemplate()
            {
                Subject = subject,
                Content = content
            };
        }

        public static MailTemplate ReplaceVariable(MailTemplate template, dynamic variable)
        {
            string newSubject = template.Subject;
            string newContent = template.Content;
            foreach (var prop in variable.GetType().GetProperties())
            {
                var value = prop.GetValue(variable);
                newSubject = newSubject.Replace("{{" + prop.Name + "}}", value.ToString());
                newContent = newContent.Replace("{{" + prop.Name + "}}", value.ToString());
            }

            return new MailTemplate() { Subject = newSubject, Content = newContent };
        }
        public static MailTemplate ReplaceVariable(MailTemplate template, Dictionary<string, string> variable)
        {
            string newSubject = template.Subject;
            string newContent = template.Content;

            foreach (string key in variable.Keys)
            {
                newSubject = newSubject.Replace("{{" + key + "}}", variable[key]);
                newContent = newContent.Replace("{{" + key + "}}", variable[key]);
            }
            return new MailTemplate() { Subject = newSubject, Content = newContent };
        }
    }


    public class MailTemplate
    {
        public string Subject { get; set; }
        public string Content { get; set; }
    }
}