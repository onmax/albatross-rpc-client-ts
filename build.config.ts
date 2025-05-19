import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/http',
    'src/ws',
    'src/client',
    'src/types',
    'src/browser',
  ],
  clean: true,
  declaration: 'node16',
  rollup: {
    emitCJS: true,
  },
})
