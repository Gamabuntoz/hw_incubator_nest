import { Injectable } from '@nestjs/common';
import { User } from 'src/features/users/applications/users.schema';
import nodemailer from 'nodemailer';
import { EmailSenderDTO } from './email.dto';

const senderData = {
  service: 'gmail',
  auth: {
    user: 'bonypiper@gmail.com',
    pass: 'zfzmivezoxwgectq',
  },
};
const transporter = nodemailer.createTransport(
  new EmailSenderDTO('gmail', {
    user: senderData.auth.user,
    pass: senderData.auth.pass,
  }),
);

@Injectable()
export class EmailAdapter {
  sendEmail(user: User) {
    transporter.sendMail({
      from: 'SAMURAIS-API, <bonypiper@gmail.com>',
      to: user.accountData.email,
      subject: 'Registration',
      html: `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='https://hw-incubator-nest.vercel.app/registration-confirmation?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
            </p>`,
    });
    return true;
  }
  sendEmailForPasswordRecovery(user: User) {
    transporter.sendMail({
      from: 'SAMURAIS-API, <bonypiper@gmail.com>',
      to: user.accountData.email,
      subject: 'Password Recovery',
      html: `<h1>Password recovery</h1>
                        <p>To finish password recovery please follow the link below:
                           <a href='https://incubator-hw.vercel.app/password-recovery?recoveryCode=${user.passwordRecovery?.code}'>recovery password</a>
                        </p>`,
    });
    return true;
  }
}
