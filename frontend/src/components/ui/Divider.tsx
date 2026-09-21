export function Divider({ className }: {className?:string}) {
  return <hr className={"border-[rgba(255,255,255,0.06)] "+(className||"")} />
}
