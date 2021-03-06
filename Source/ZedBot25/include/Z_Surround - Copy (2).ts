# INCLUDE: Z_Surround 
#
# Gosub :Z_Surround~SURROUND 
#
# SURROUND 
# SetVar $Z_Surround~surroundwave to the attack wave 
# SetVar $Z_Surround~surroundowner to "c" or "p" (optional) 
# SetVar $Z_Surround~surroundfigs to number of figs to drop (optional) 
# SetVar $Z_Surround~surroundmines to number of mines to drop (optional) 
# SetVar $Z_Surround~surroundlimps to number of limps to drop (optional) 
# SetVar $Z_Surround~suppressss to TRUE to suppress SS output (optional) 
# SetVar $Z_Surround~forced to TRUE to ignore limpets in sector (optional) 
# SetVar $Z_Surround~clear to TRUE to clear enemy limpets (optional) 
# Call from the COMMAND prompt. 
:SURROUND
Send "*"
send "sd"
Gosub :SYNC
If ($surroundowner = "") or ($surroundowner = "0")
	SetVar $surroundowner "c"
End
If ($surroundfigs = "") or ($surroundfigs = "0")
	SetVar $Z_Surround~surroundfigs 1
End
SetVar $surround CURRENTSECTOR
SetVar $warpcount SECTOR.WARPCOUNT[$surround]
SetVar $count 1
If ($clear = TRUE)
	SetVar $ssoutput "Zed's Surround & Clear*-------------------------*"
Else
	SetVar $ssoutput "Zed's Surround*-----------------*"
End
If ($surround <> STARDOCK) and ($surround > 10) and ($surround <= SECTORS)
	Send "fz" & $surroundfigs & "*" & $surroundowner & "qz*d* "
	SetSectorParameter $surround "FIGSEC" TRUE
End
While ($count <= $warpcount)
	SetVar $adjacent SECTOR.WARPS[$surround][$count]
	SetVar $anomoly SECTOR.ANOMOLY[$adjacent]
	SetVar $density SECTOR.DENSITY[$adjacent]
	SetVar $navhaz SECTOR.NAVHAZ[$adjacent]
	GetSectorParameter $adjacent "FIGSEC" $isfigged
	If (($isfigged <> TRUE) or ($clear = TRUE)) and ($density < 500) and ($navhaz <= 10) and ($adjacent > 10) and ($adjacent <> STARDOCK)
		If ($anomoly = TRUE)
			GetSectorParameter $adjacent "LIMPSEC" $islimped
			If ($islimped <> TRUE) and ($forced <> TRUE) and ($clear <> TRUE)
				SetVar $Z_Strings~padchar " "
				SetVar $Z_Strings~padlen 5
				SetVar $Z_Strings~unpadded $adjacent
				Gosub :Z_Strings~PAD
				SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " NOT visited - detected anomalies.*")
				Goto :SURROUNDNOTOK
			End
		End
		SetTextLineTrigger sok :SURROUNDOK $adjacent & " > "
		Send "^f" & $adjacent & "*" & $surround & "*"
		Pause
:SURROUNDOK
		GetWord CURRENTLINE $returnsurround 3
		Send "q"
		If ($returnsurround = $surround)
			If ($clear = TRUE)
				Send "m " & $adjacent & "*    za" & $surroundwave & "* *  fz" & $surroundfigs & "*" & $surroundowner & "qz*d* "
:STARTCLEAR
				SetTextTrigger needsclear :NEEDSCLEAR "These mines are not under your control."
				SetTextTrigger isclear :ISCLEAR "How many Limpet mines do you want defending this sector?"
				Send "h 2"
				Pause
:NEEDSCLEAR
				KillTrigger isclear
				KillTrigger needsclear
				Gosub :SYNC
				Gosub :EXITENTER
				Goto :STARTCLEAR
:ISCLEAR
				KillTrigger needsclear
				KillTrigger isclear
				If ($surroundlimps > 0)
					Send $surroundlimps & " * z" & $surroundowner & "* "
					SetSectorParameter $adjacent "LIMPSEC" TRUE
				Else
					Send "0 * "
				End
				If ($surroundmines > 0)
					Send "h 1 z" & $surroundmines & " * z" & $surroundowner & "* "
					SetSectorParameter $adjacent "MINESEC" TRUE
				End
				Send "<za" & $surroundwave & "* *  "
				SetVar $Z_Strings~padchar " "
				SetVar $Z_Strings~padlen 5
				SetVar $Z_Strings~unpadded $adjacent
				Gosub :Z_Strings~PAD
				SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " Visited     - now cleared & figged.*")
				SetSectorParameter $adjacent "FIGSEC" TRUE
			Else
				If ($surroundmines > 0) and ($surroundlimps > 0)
					Send "m " & $adjacent & "*    za" & $surroundwave & "* *  fz" & $surroundfigs & "*" & $surroundowner & "qz*d* h 1 z" & $surroundmines & " * z" & $surroundowner & "* h 2 z" & $surroundlimps & " * z" & $surroundowner & "* <za" & $surroundwave & "* *  "
					SetSectorParameter $adjacent "MINESEC" TRUE
					SetSectorParameter $adjacent "LIMPSEC" TRUE
				ElseIf ($surroundmines > 0)
					Send "m " & $adjacent & "*    za" & $surroundwave & "* *  fz" & $surroundfigs & "*" & $surroundowner & "qz*d* h 1 z" & $surroundmines & " * z" & $surroundowner & "* <za" & $surroundwave & "* *  "
					SetSectorParameter $adjacent "MINESEC" TRUE
				ElseIf ($surroundlimps > 0)
					Send "m " & $adjacent & "*    za" & $surroundwave & "* *  fz" & $surroundfigs & "*" & $surroundowner & "qz*d* h 2 z" & $surroundlimps & " * z" & $surroundowner & "* <za" & $surroundwave & "* *  "
					SetSectorParameter $adjacent "LIMPSEC" TRUE
				Else
					Send "m " & $adjacent & "*    za" & $surroundwave & "* *  fz" & $surroundfigs & "*" & $surroundowner & "qz*d*<za" & $surroundwave & "* *  "
				End
				SetVar $Z_Strings~padchar " "
				SetVar $Z_Strings~padlen 5
				SetVar $Z_Strings~unpadded $adjacent
				Gosub :Z_Strings~PAD
				SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " Visited     - now figged.*")
				SetSectorParameter $adjacent "FIGSEC" TRUE
			End
		Else
			SetVar $Z_Strings~padchar " "
			SetVar $Z_Strings~padlen 5
			SetVar $Z_Strings~unpadded $adjacent
			Gosub :Z_Strings~PAD
			SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " NOT visited - detected one-way.*")
		End
:SURROUNDNOTOK
	Else
		If ($density > 499)
			SetVar $Z_Strings~padchar " "
			SetVar $Z_Strings~padlen 5
			SetVar $Z_Strings~unpadded $adjacent
			Gosub :Z_Strings~PAD
			SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " NOT visited - density levels too high.*")
		ElseIf ($navhaz > 10)
			SetVar $Z_Strings~padchar " "
			SetVar $Z_Strings~padlen 5
			SetVar $Z_Strings~unpadded $adjacent
			Gosub :Z_Strings~PAD
			SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " NOT visited - navhaz detected.*")
		ElseIf ($adjacent <= 10) or ($adjacent = STARDOCK)
			SetVar $Z_Strings~padchar " "
			SetVar $Z_Strings~padlen 5
			SetVar $Z_Strings~unpadded $adjacent
			Gosub :Z_Strings~PAD
			SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " NOT visited - Fedspace.*")
		ElseIf ($isfigged = TRUE)
			SetVar $Z_Strings~padchar " "
			SetVar $Z_Strings~padlen 5
			SetVar $Z_Strings~unpadded $adjacent
			Gosub :Z_Strings~PAD
			SetVar $ssoutput ($ssoutput & " Sector: " & $Z_Strings~padded & " NOT visited - already figged.*")
		End
	End
	SetVar $count ($count + 1)
End
If ($suppressss <> TRUE)
	Send "'*"
	Send "------------------------------------------------------------*"
	Send $ssoutput
	Send "------------------------------------------------------------**"
End
Return
# SYNC 
:SYNC
KillTrigger av
KillTrigger av2
KillTrigger av3
KillTrigger av4
SetTextTrigger av :AV "Average Interval Lag:"
SetTextTrigger av2 :AV "Network Ping:"
SetDelayTrigger av3 :SYNC 10000
SetTextTrigger av4 :AV "Event Lag:"
Send "@"
Pause
:AV
KillTrigger av
KillTrigger av2
KillTrigger av3
KillTrigger av4
Return
# EXITENTER 
:EXITENTER
SetDelayTrigger timeout :TIMEOUT 20000
SetTextTrigger ee1 :EE1 "Do you wish to engage a Cloaking Device?"
SetTextTrigger ee2 :EE2 "Enter your choice:"
SetTextTrigger ee3 :EE3 "Show today's log? (Y/N) [N]"
SetTextTrigger ee4 :EE4 "[Pause]"
SetTextTrigger ee5 :EE5 "Password?"
SetTextTrigger ee6 :EE6 "Delete messages? (Y/N) [N]"
SetTextTrigger ee7 :EE7 "You have to destroy"
SetTextTrigger ee8 :EE8 "Do you wish to clear some avoids? (Y/N) [N]"
SetTextTrigger ee9 :EE9 "Searching for messages received since your last time on:"
SetTextTrigger ee10 :EE10 "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
SetTextTrigger ee11 :EE11 "Please enter your name (ENTER for none):"
SetTextTrigger ee12 :EE12 "Game Server"
Send "qy"
Pause
:EE1
Send "n"
Pause
:EE2
Send "t*"
SetTextTrigger eedone :EEDONE "Command [TL="
Pause
:EE3
Send "*"
Pause
:EE4
Send "y*"
SetTextTrigger ee4 :EE4 "[Pause]"
Pause
:EE5
Send PASSWORD & "*"
SetTextTrigger ee5 :EE5 "Password?"
Pause
:EE6
Send "y*"
Pause
:EE7
Send "za9999*za9999*za9999*za9999*za9999*za9999*"
Pause
:EE8
Send "*"
Pause
:EE9
KillTrigger timeout
Pause
:EE10
Send "n"
Pause
:EE11
Send LOGINNAME & "*"
Pause
:EE12
Send GAME
Pause
:TIMEOUT
KillAllTriggers
DISCONNECT
SetDelayTrigger waitfordisconnect :WAITFORDISCONNECT 10000
Pause
:WAITFORDISCONNECT
KillTrigger waitfordisconnect
If (CONNECTED = FALSE)
	CONNECT
	HALT
End
Pause
:EEDONE
KillTrigger ee1
KillTrigger ee2
KillTrigger ee3
KillTrigger ee4
KillTrigger ee5
KillTrigger ee6
KillTrigger ee7
KillTrigger ee8
KillTrigger ee9
KillTrigger ee10
KillTrigger ee11
KillTrigger ee12
KillTrigger eedone
KillTrigger timeout
Return
# INCLUDES 
Include include\Z_Strings.ts
