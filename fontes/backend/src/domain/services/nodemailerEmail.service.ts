const nodemailer = require('nodemailer');
const IEmailService = require('./IEmail.service');
const emailConfig = require('../config/emailConfig');

class NodemailerEmailService extends IEmailService {
  constructor() {
    super();

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: emailConfig.auth.user,
      to,
      subject,
      text
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = NodemailerEmailService;