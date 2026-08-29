Set objArgs = WScript.Arguments
Set objShell = CreateObject("Wscript.Shell")
strArgs = ""
If objArgs.Count > 0 Then
    strArgs = " -TargetFile """ & objArgs(0) & """"
End If
strCommand = "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\windows_tools\share_to_lumina.ps1""" & strArgs
objShell.Run strCommand, 0, False