import { Ability, MongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
export enum PermissionAction {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
export type PermissionObjectType = any;
export type PermissionconditionsType = any;

export type AppAbility = MongoAbility<[PermissionAction, PermissionObjectType]>;

interface CaslPermission {
  action: PermissionAction;
  subject: string;
  condition?: PermissionCondition;
}
export interface PermissionCondition {
  [key: string]: any;
}

@Injectable()
export class CaslAbilityFactory {
  constructor(private authService: AuthService) {}
  async createForUser(user: Record<string, any>): Promise<AppAbility> {
    const dbPermissions = await this.authService.permissions(user.roles);
    const caslPermissions: CaslPermission[] = dbPermissions.map(
      (p: { action: any; subject: any; conditions: PermissionCondition }) => ({
        action: p.action,
        subject: p.subject,
        conditions: this.parseCondition(p.conditions, {
          id: user.id,
          role_level: user.role_level,
        }),
      }),
    );
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

      const matches = /^\${([a-zA-Z0-9_]+)}$/.exec(rawValue);
      if (!matches) {
        parsedCondition[key] = rawValue;
        continue;
      }

      const variableName = matches[1];
      if (!variables.hasOwnProperty(variableName)) {
        throw new ReferenceError(`Variable ${variableName} is not defined`);
      }

      parsedCondition[key] = variables[variableName];
    }
    return parsedCondition;
  }
}
