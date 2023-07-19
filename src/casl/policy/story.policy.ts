import { PermissionSubject } from 'src/common/permission-subject';

export class Story {
  created_by: any;

  constructor(created_by?: string) {
    this.created_by = created_by;
  }
}
