import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/http',
    'src/types/index',
  ],
  clean: true,
  declaration: 'node16',
})
