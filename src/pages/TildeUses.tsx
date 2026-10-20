import { uses } from '../content/booth/uses'
import BoothStation from './BoothStation'

// /tilde/uses: the booth's uses station (taptilde.com/uses). English only (tilde-review/briefs/booth-site.md).
export default function TildeUses() {
  return <BoothStation station={uses} />
}
