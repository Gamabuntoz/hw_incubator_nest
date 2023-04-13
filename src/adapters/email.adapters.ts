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
  async sendEmail(user: User) {
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log('Server is ready to take our messages');
          resolve(success);
        }
      });
    });
    await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: 'SAMURAIS-API, <bonypiper@gmail.com>',
          to: user.accountData.email,
          subject: 'Registration',
          html: `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='https://hw-incubator-nest.vercel.app/registration-confirmation?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
            </p>`,
        },
        (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(info);
            resolve(info);
          }
        },
      );
    });
    return true;
  }
  async sendEmailForPasswordRecovery(user: User) {
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log('Server is ready to take our messages');
          resolve(success);
        }
      });
    });
    await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: 'SAMURAIS-API, <bonypiper@gmail.com>',
          to: user.accountData.email,
          subject: 'Password Recovery',
          html: `<h1>Password recovery</h1>
                        <p>To finish password recovery please follow the link below:
                           <a href='https://incubator-hw.vercel.app/password-recovery?recoveryCode=${user.passwordRecovery?.code}'>recovery password</a>
                        </p>`,
        },
        (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(info);
            resolve(info);
          }
        },
      );
    });
    return true;
  }
}
