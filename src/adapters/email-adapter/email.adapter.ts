import { Injectable } from '@nestjs/common';
import { User } from 'src/features/users/applications/users.schema';
import nodemailer from 'nodemailer';
import { senderData } from '../../helpers/constants';

@Injectable()
export class EmailAdapter {
  async sendEmail(user: User) {
    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: senderData.user,
        pass: senderData.pass,
      },
      secure: true,
    });
    await transporter.sendMail({
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
  async sendEmailForPasswordRecovery(user: User) {
    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: senderData.user,
        pass: senderData.pass,
      },
      secure: true,
    });
    await transporter.sendMail({
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
