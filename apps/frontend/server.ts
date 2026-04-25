import { AngularNodeAppEngine, writeResponseToNodeResponse } from '@angular/ssr/node';
import * as express from 'express';
import { join } from 'node:path';

export function app(): express.Express {
  const server = express();
  const browserDistFolder = join(__dirname, '../browser');
  const angularApp = new AngularNodeAppEngine();

  server.use(
    express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }),
  );

  server.use(
    '/**',
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      angularApp
        .handle(req)
        .then(response => {
          if (response) {
            writeResponseToNodeResponse(response, res);
          } else {
            next();
          }
        })
        .catch(next);
    },
  );

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
