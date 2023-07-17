import { Ability } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
export type PermissionObjectType = any;
export type PermissionconditionsType = any;

export type AppAbility = Ability<[PermissionAction, PermissionObjectType]>;

interface CaslPermission {
  action: PermissionAction;
  subject: string;
  condition?: PermissionCondition;
}
export interface PermissionCondition {}

@Injectable()
export class CaslAbilityFactory {
  constructor(private authService: AuthService) {}
  async createForUser(user): Promise<AppAbility> {
    console.log('role', user);
    const dbPermissions = await this.authService.permissions(user.roles);
    console.log('dbPermissions', dbPermissions);
    const caslPermissions: CaslPermission[] = dbPermissions.map((p) => ({
      action: p.action,
      subject: p.subject,
      conditions: this.parseCondition(p.conditions, user),
    }));
    console.log('caslPermissions', caslPermissions);
    return new Ability<[PermissionAction, PermissionObjectType]>(
      caslPermissions,
    );
  }

  /**
   * @param condition: {"departmentId": "${id}"}
   * @param variables: {"id: 1"}
   * @return condition after parse: {"departmentId": 1}
   */
  public parseCondition(
    condition: PermissionCondition,
    variables: Record<string, any>,
  ): PermissionCondition {
    if (!condition) return null;
    const parsedCondition = {};
    for (const [key, rawValue] of Object.entries(condition)) {
      if (rawValue !== null && typeof rawValue === 'object') {
        const value = this.parseCondition(rawValue, variables);
        parsedCondition[key] = value;
        continue;
      }
      if (typeof rawValue !== 'string') {
        parsedCondition[key] = rawValue;
        continue;
      }
      // find placeholder "${}""
      const matches = /^\\${([a-zA-Z0-9]+)}$/.exec(rawValue);
      if (!matches) {
        parsedCondition[key] = rawValue;
        continue;
      }
      const value = variables[matches[1]];
      if (typeof value === 'undefined') {
        throw new ReferenceError(`Variable ${name} is not defined`);
      }
      parsedCondition[key] = value;
    }
    return parsedCondition;
  }
}
