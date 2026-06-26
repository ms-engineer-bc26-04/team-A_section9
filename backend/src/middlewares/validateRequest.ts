import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

type ValidateRequestSchemas = {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

const getValidationErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray(error.issues) &&
    error.issues[0]?.message
  ) {
    return error.issues[0].message
  }

  return '入力内容に誤りがあります'
}

export const validateRequest = (schemas: ValidateRequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const targets = ['body', 'query', 'params'] as const

    for (const target of targets) {
      const schema = schemas[target]

      if (!schema) {
        continue
      }

      const result = schema.safeParse(req[target])

      if (!result.success) {
        res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: getValidationErrorMessage(result.error),
          },
        })
        return
      }

      req[target] = result.data
    }

    next()
  }
}
