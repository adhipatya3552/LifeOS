"""Generate LifeOS demo video script PDF in the project root."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.enums import TA_CENTER
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "LifeOS-Demo-Video-Script.pdf"

primary = HexColor("#7c5cff")
muted = HexColor("#475569")
bg_soft = HexColor("#f8f7fc")
ink = HexColor("#0f172a")

styles = getSampleStyleSheet()

styles.add(
    ParagraphStyle(
        name="DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=ink,
        spaceAfter=6,
        alignment=TA_CENTER,
        leading=26,
    )
)
styles.add(
    ParagraphStyle(
        name="DocSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        textColor=muted,
        spaceAfter=14,
        alignment=TA_CENTER,
        leading=15,
    )
)
styles.add(
    ParagraphStyle(
        name="H1Custom",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=primary,
        spaceBefore=14,
        spaceAfter=8,
        leading=18,
    )
)
styles.add(
    ParagraphStyle(
        name="H2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=ink,
        spaceBefore=12,
        spaceAfter=6,
        leading=16,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=ink,
        leading=14,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Say",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10,
        textColor=HexColor("#1e293b"),
        leading=14,
        leftIndent=8,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="Label",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=primary,
        spaceBefore=4,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=ink,
        leading=13,
        leftIndent=12,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=muted,
        leading=12,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        textColor=ink,
        leading=11,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        textColor=white,
        leading=11,
    )
)
styles.add(
    ParagraphStyle(
        name="FooterNote",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        textColor=muted,
        alignment=TA_CENTER,
    )
)


def section_header(time_range: str, title: str) -> Paragraph:
    return Paragraph(f"{time_range} · {title}", styles["H2Custom"])


def main() -> None:
    story = []

    story.append(Paragraph("LifeOS Demo Video Script", styles["DocTitle"]))
    story.append(
        Paragraph(
            "HiDevs / AI House nomination · Target length: under 2 minutes (~1:50)<br/>"
            "Tone: clear, confident, product-first · Product: "
            "https://life-os-five-iota.vercel.app",
            styles["DocSub"],
        )
    )
    story.append(
        HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=12)
    )

    story.append(Paragraph("Pre-recording setup", styles["H1Custom"]))
    for item in [
        "Open production URL in a clean browser profile (hide bookmarks bar).",
        "Prefer already signed in (saves time).",
        "Connect Gmail + Calendar; have 1–2 real unread emails if possible.",
        "Calendar should have something for today.",
        "Settings → “Require approval for write actions” ON if you will show Approve.",
        "Record at 1080p; browser zoom 100–110%.",
    ]:
        story.append(Paragraph(f"• {item}", styles["BulletBody"]))

    story.append(Paragraph("Full script with timestamps", styles["H1Custom"]))

    # Scene 1
    story.append(section_header("0:00–0:12", "Hook (face or voice + logo)"))
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Full-screen browser on landing, or face cam small + landing behind. "
            "Cursor still.",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“Hi — I’m [Name], and this is <b>LifeOS</b>, my personal AI operating "
            "system. You chat in plain English, and it actually runs <b>Gmail, Google "
            "Calendar, and Drive</b> for you — with private OAuth and approvals when "
            "something sensitive happens.”",
            styles["Say"],
        )
    )

    # Scene 2
    story.append(section_header("0:12–0:28", "Landing + interactive demo"))
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Scroll landing once; click <b>two</b> demo chips (e.g. “Summarize inbox” "
            "→ “Book meeting”). Don’t rush.",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“On the marketing site, visitors can try a live preview with no signup. "
            "Same action cards they’ll see in the real app — so they get the product "
            "in seconds.”",
            styles["Say"],
        )
    )
    story.append(Paragraph("SHOW ON SCREEN", styles["Label"]))
    for item in [
        "Hero headline (“control room”)",
        "DemoSimulator running",
        "Nav / Get Started briefly",
    ]:
        story.append(Paragraph(f"• {item}", styles["BulletBody"]))

    # Scene 3
    story.append(section_header("0:28–0:42", "Sign-in → dashboard systems"))
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Click Launch / Get Started only if needed; prefer cut to already-logged-in "
            "<b>Dashboard</b>. Point at Gmail / Calendar / Drive <b>Online</b> chips and "
            "empty-state starters if visible.",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“After Auth0 sign-in, you land in the control room. Connected services show "
            "as online, and starters get you going fast — summarize inbox, today’s "
            "calendar, Drive docs, free slots.”",
            styles["Say"],
        )
    )

    # Scene 4
    story.append(section_header("0:42–0:55", "Connections (trust)"))
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Open <b>Connections</b>. Hover one service. Expand “Google hasn’t verified "
            "this app?” for ~2 seconds (optional but strong).",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“Each Google service connects with its own OAuth scopes. Tokens live in my "
            "private Convex database — not a fake vault story. If Google shows the "
            "unverified-app screen, that’s normal for personal projects; the flow is "
            "documented right here.”",
            styles["Say"],
        )
    )

    # Scene 5
    story.append(section_header("0:55–1:25", "Live agent (core wow)"))
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Back to <b>Dashboard</b>. Type or paste (clear, large font):",
            styles["Body"],
        )
    )
    story.append(
        Paragraph(
            "<b>Summarize my unread emails and tell me what's on my calendar today.</b>",
            styles["Body"],
        )
    )
    story.append(
        Paragraph(
            "Send. Wait for stream + action cards. Scroll so both Gmail and Calendar "
            "cards are visible.",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“One message — multi-service. LifeOS hits Gmail and Calendar with real "
            "tools, streams the answer, and logs what it did. No copy-paste between "
            "tabs.”",
            styles["Say"],
        )
    )
    story.append(
        Paragraph(
            "<b>If time is tight:</b> one prompt only — “Summarize my unread emails.”",
            styles["Small"],
        )
    )

    # Scene 6
    story.append(
        section_header("1:25–1:42", "Human-in-the-loop (optional but great)")
    )
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Prompt like: <b>Create a calendar event called LifeOS demo tomorrow at "
            "3pm for 30 minutes.</b> Show pending approval → click <b>Approve</b> → "
            "success card. (If write approval is off, skip and extend the live prompt "
            "section.)",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“For writes — create event, send email — I can require explicit approval. "
            "The agent proposes; I stay in control.”",
            styles["Say"],
        )
    )

    # Scene 7
    story.append(section_header("1:42–1:55", "Close + nomination CTA"))
    story.append(Paragraph("RECORD", styles["Label"]))
    story.append(
        Paragraph(
            "Cut back to landing hero or History page (quick flash of audit log). "
            "Freeze on logo + URL.",
            styles["Body"],
        )
    )
    story.append(Paragraph("SAY", styles["Label"]))
    story.append(
        Paragraph(
            "“That’s <b>LifeOS</b> — chat to run your Google life, securely and with "
            "approvals. Built with Auth0, Convex, and OpenRouter. If you’re voting on "
            "HiDevs / AI House, support <b>LifeOS</b> — link’s in the post. Thanks!”",
            styles["Say"],
        )
    )

    story.append(Paragraph("Shot list — what to capture", styles["H1Custom"]))

    cell = styles["TableCell"]
    head = styles["TableHead"]
    rows = [
        [
            Paragraph("Time", head),
            Paragraph("Shot", head),
            Paragraph("Window / action", head),
        ],
        [
            Paragraph("0:00", cell),
            Paragraph("Title", cell),
            Paragraph("Landing full browser, 1080p, zoom 100–110%", cell),
        ],
        [
            Paragraph("0:12", cell),
            Paragraph("Demo", cell),
            Paragraph("Click 2 preset chips on landing", cell),
        ],
        [
            Paragraph("0:28", cell),
            Paragraph("App shell", cell),
            Paragraph("Dashboard empty / systems online", cell),
        ],
        [
            Paragraph("0:42", cell),
            Paragraph("Trust", cell),
            Paragraph("Connections page + OAuth explainer", cell),
        ],
        [
            Paragraph("0:55", cell),
            Paragraph("Core", cell),
            Paragraph("One multi-tool chat, show action cards", cell),
        ],
        [
            Paragraph("1:25", cell),
            Paragraph("Safety", cell),
            Paragraph("Approve a create-event (optional)", cell),
        ],
        [
            Paragraph("1:42", cell),
            Paragraph("End card", cell),
            Paragraph("URL + “LifeOS · AI personal OS” 3 seconds", cell),
        ],
    ]

    table = Table(rows, colWidths=[0.7 * inch, 1.0 * inch, 4.8 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), primary),
                ("BACKGROUND", (0, 1), (-1, 1), bg_soft),
                ("BACKGROUND", (0, 3), (-1, 3), bg_soft),
                ("BACKGROUND", (0, 5), (-1, 5), bg_soft),
                ("BACKGROUND", (0, 7), (-1, 7), bg_soft),
                ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(table)

    story.append(Paragraph("Recording tips (keep under 2:00)", styles["H1Custom"]))
    for item in [
        "Crop the browser — hide bookmarks bar; use a clean profile.",
        "Don’t narrate every click — let UI breathe 1–2 seconds after actions.",
        "If the model is slow, cut a mid-stream jump once tools finish (still honest).",
        "No need for Settings deep-dive unless you have 10 spare seconds.",
        "End card text on screen: LifeOS · https://life-os-five-iota.vercel.app · "
        "Gmail · Calendar · Drive · Approvals",
    ]:
        story.append(Paragraph(f"• {item}", styles["BulletBody"]))

    story.append(Paragraph("Optional on-screen captions", styles["H1Custom"]))
    for item in [
        "0:00 — Personal AI OS for Google",
        "0:55 — One prompt → real tools",
        "1:25 — You approve writes",
        "1:42 — Vote / try the link",
    ]:
        story.append(Paragraph(f"• {item}", styles["BulletBody"]))

    story.append(Paragraph("Length check", styles["H1Custom"]))
    story.append(
        Paragraph(
            "Spoken copy is about <b>230–260 words</b> → roughly <b>1:40–1:55</b> at a "
            "calm pace. If you run long, drop the approval segment first — not the live "
            "Gmail/Calendar demo.",
            styles["Body"],
        )
    )

    story.append(Spacer(1, 16))
    story.append(
        HRFlowable(
            width="100%", thickness=0.8, color=HexColor("#e2e8f0"), spaceAfter=8
        )
    )
    story.append(
        Paragraph(
            "LifeOS · Demo video script for HiDevs / AI House · "
            "Project: personal-lifeos-agent",
            styles["FooterNote"],
        )
    )

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(muted)
        page = canvas.getPageNumber()
        canvas.drawCentredString(letter[0] / 2, 0.55 * inch, f"Page {page}")
        canvas.drawString(0.75 * inch, 0.55 * inch, "LifeOS Demo Script")
        canvas.restoreState()

    doc = SimpleDocTemplate(
        str(OUT_PATH),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.8 * inch,
        title="LifeOS Demo Video Script",
        author="LifeOS",
        subject="Under 2 minute demo script for HiDevs / AI House nomination",
    )
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
