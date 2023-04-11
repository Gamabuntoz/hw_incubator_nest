export class EmailSenderDTO {
  constructor(
    public service: string,
    public auth: {
      user: string;
      pass: string;
    },
  ) {}
}
