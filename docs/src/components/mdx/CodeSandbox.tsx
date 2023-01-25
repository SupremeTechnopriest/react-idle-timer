export function CodeSandbox (props: { name: string }) {
  return (
    <iframe src={`https://codesandbox.io/embed/${props.name}?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.tsx&theme=dark&view=editor`}
      style={{
        width: '100%',
        height: '500px',
        border: 0,
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '2em'
      }}
      title="activity-detection"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  )
}
