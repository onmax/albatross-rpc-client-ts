import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/http',
    'src/ws',
    'src/client',
    'src/types',
    'src/schemas',
  ],
  clean: true,
  declaration: 'node16',
  rollup: {
    emitCJS: true,
  },
})
