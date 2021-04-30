export default interface SqlError {
  file: string,
  line: number,
  message: string,
  startColumn: number,
  endColumn: number
}
