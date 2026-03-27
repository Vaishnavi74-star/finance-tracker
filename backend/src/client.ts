import { PrismaClient, Prisma } from '@prisma/client';

enum PrismaOperation {
  findUnique = 'findUnique',
  findUniqueOrThrow = 'findUniqueOrThrow',
  findMany = 'findMany',
  findFirst = 'findFirst',
  findFirstOrThrow = 'findFirstOrThrow',
  create = 'create',
  createMany = 'createMany',
  createManyAndReturn = 'createManyAndReturn',
  update = 'update',
  updateMany = 'updateMany',
  updateManyAndReturn = 'updateManyAndReturn',
  upsert = 'upsert',
  delete = 'delete',
  deleteMany = 'deleteMany',
  executeRaw = 'executeRaw',
  queryRaw = 'queryRaw',
  aggregate = 'aggregate',
  count = 'count',
  runCommandRaw = 'runCommandRaw',
  findRaw = 'findRaw',
  groupBy = 'groupBy'
}

const getGlobalFiltersExtension = () => {
  return Prisma.defineExtension({
    name: 'globalFilters',
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }: any) {
          const globalData = { isDeleted: false };

          switch (operation) {
            case PrismaOperation.findUnique:
            case PrismaOperation.findUniqueOrThrow:
            case PrismaOperation.findMany:
            case PrismaOperation.findFirst:
            case PrismaOperation.findFirstOrThrow:
            case PrismaOperation.count:
            case PrismaOperation.groupBy:
            case PrismaOperation.aggregate:
            case PrismaOperation.update:
            case PrismaOperation.updateMany:
            case PrismaOperation.updateManyAndReturn:
            case PrismaOperation.delete:
            case PrismaOperation.deleteMany:
              args.where = {
                ...globalData,
                ...(args.where || {})
              };
              break;

            case PrismaOperation.create:
              if (args.data) {
                args.data = {
                  ...globalData,
                  ...args.data
                };
              }
              break;

            case PrismaOperation.createMany:
            case PrismaOperation.createManyAndReturn:
              if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => ({
                  ...globalData,
                  ...item
                }));
              }
              break;

            case PrismaOperation.upsert:
              args.where = {
                ...globalData,
                ...(args.where || {})
              };
              if (args.create) {
                args.create = {
                  ...globalData,
                  ...args.create
                };
              }
              break;
          }

          return query(args);
        }
      }
    }
  });
};

const prisma = new PrismaClient().$extends(getGlobalFiltersExtension());

export default prisma;
