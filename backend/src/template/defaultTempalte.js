export const emailTemplate = ({ title, message, buttonText, buttonLink }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background:#5a4a2e; font-family: Open Sans, sans-serif; color: #0d0d0d">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background:#5a4a2e; padding:20px; text-align:center;">
              <h1 style="margin:0; font-size:24px;color:#fff">VasanWears</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;text-align:center;">${title}</h2>
              <p style="line-height:1.6; font-size:15px;text-align:center;">
                ${message}
              </p>

              ${buttonText
    ? `
              <div style="text-align:center; margin:30px 0;">
                <a href="${buttonLink}" 
                   style="background:#5a4a2e; color:#ffffff; padding:14px 26px; text-decoration:none; border-radius:4px; font-size:14px;">
                  ${buttonText}
                </a>
              </div>`
    : ""
  }

              <p style="font-size:13px; color:#777;text-align:center;">
                If you didn’t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#777;">
              © ${new Date().getFullYear()} VasanWears. All rights reserved.<br/>
              Need help? Contact us at <a href="mailto:info@vasanwears.in" style="color:#5a4a2e;">info@vasanwears.in</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;