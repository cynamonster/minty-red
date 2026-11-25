import AppKit
import Foundation

struct OGCard {
    let slug: String
    let url: String
    let topRightGrey: String
    let topRightAccent: String
    let category: String
    let headline: String
    let colorR: Double
    let colorG: Double
    let colorB: Double
    let description: String
}

let cards: [OGCard] = [
    OGCard(
        slug: "orbitdrop",
        url: "MINTY.RED/ORBITDROP",
        topRightGrey: "5 MISSIONS",
        topRightAccent: "DAILY EXPEDITION",
        category: "// GRAVITY PUZZLE",
        headline: "ORBITDROP",
        colorR: 56/255.0, colorG: 189/255.0, colorB: 248/255.0, // #38bdf8
        description: "Slingshot your space probes around the gravity of planets and steer them into the goal portal."
    ),
    OGCard(
        slug: "ethnos",
        url: "MINTY.RED/ETHNOS",
        topRightGrey: "5 ROUNDS",
        topRightAccent: "DAILY CHALLENGE",
        category: "// WORLD FACES & GEOGRAPHY",
        headline: "ETHNOS",
        colorR: 6/255.0, colorG: 182/255.0, colorB: 212/255.0, // #06b6d4
        description: "Look at real composite portraits of people from across the globe and pinpoint their home regions on the world map."
    ),
    OGCard(
        slug: "bearinglock",
        url: "MINTY.RED/BEARINGLOCK",
        topRightGrey: "5 CORRIDORS",
        topRightAccent: "DAILY COMPASS",
        category: "// TACTILE GLOBAL NAVIGATION",
        headline: "BEARING LOCK",
        colorR: 245/255.0, colorG: 158/255.0, colorB: 11/255.0, // #f59e0b
        description: "Spin a 360-degree compass dial to lock onto the exact direction of famous world landmarks."
    ),
    OGCard(
        slug: "relic",
        url: "MINTY.RED/RELIC",
        topRightGrey: "5 ARTIFACTS",
        topRightAccent: "DAILY CHALLENGE",
        category: "// ARCHEOLOGY & GEOGRAPHY",
        headline: "R.E.L.I.C.",
        colorR: 168/255.0, colorG: 85/255.0, colorB: 247/255.0, // #a855f7
        description: "Inspect famous ancient treasures, guess what year they were made, and find where they were discovered before time's up."
    ),
    OGCard(
        slug: "metro",
        url: "MINTY.RED/METRO",
        topRightGrey: "5 CITIES",
        topRightAccent: "DAILY CHALLENGE",
        category: "// SUBWAY MAP REFLEX",
        headline: "METRO",
        colorR: 16/255.0, colorG: 185/255.0, colorB: 129/255.0, // #10b981
        description: "Identify cities by their subway systems."
    ),
    OGCard(
        slug: "roots",
        url: "MINTY.RED/ROOTS",
        topRightGrey: "5 NAMES",
        topRightAccent: "DAILY CHALLENGE",
        category: "// SURNAMES & LANGUAGE",
        headline: "ROOTS",
        colorR: 244/255.0, colorG: 63/255.0, colorB: 94/255.0, // #f43f5e
        description: "Trace last names back to their original languages, countries, and historical meanings."
    ),
    OGCard(
        slug: "flagship",
        url: "MINTY.RED/FLAGSHIP",
        topRightGrey: "5 FLAGS",
        topRightAccent: "DAILY VOYAGE",
        category: "// FLAG RECOGNITION",
        headline: "FLAGSHIP",
        colorR: 2/255.0, colorG: 132/255.0, colorB: 199/255.0, // #0284c7
        description: "Test your vexillology by matching national flags to their color distributions before time runs out."
    ),
    OGCard(
        slug: "hub",
        url: "MINTY.RED",
        topRightGrey: "TRY NOW",
        topRightAccent: "FREE IN BROWSER",
        category: "// MICRO ARCADE",
        headline: "MINTY.RED",
        colorR: 16/255.0, colorG: 185/255.0, colorB: 129/255.0, // #10b981
        description: "Fun, fast, free daily games right in your browser.\nFind your favorite."
    )
]

let width = 1200
let height = 630

let outputDir = URL(fileURLWithPath: "public/images/og")
try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

for card in cards {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    rep.size = NSSize(width: width, height: height)

    NSGraphicsContext.saveGraphicsState()
    let ctx = NSGraphicsContext(bitmapImageRep: rep)!
    NSGraphicsContext.current = ctx

    // Background #07090e
    let bgColor = NSColor(red: 7/255.0, green: 9/255.0, blue: 14/255.0, alpha: 1.0)
    bgColor.setFill()
    NSRect(x: 0, y: 0, width: width, height: height).fill()

    // Outer subtle border
    let borderColor = NSColor(red: 30/255.0, green: 41/255.0, blue: 59/255.0, alpha: 0.9)
    let borderPath = NSBezierPath(rect: NSRect(x: 0.5, y: 0.5, width: Double(width) - 1, height: Double(height) - 1))
    borderColor.setStroke()
    borderPath.lineWidth = 1
    borderPath.stroke()

    // Top Bar Divider line
    let dividerColor = NSColor(red: 30/255.0, green: 41/255.0, blue: 59/255.0, alpha: 0.8)
    let divider = NSBezierPath()
    divider.move(to: NSPoint(x: 80, y: height - 130))
    divider.line(to: NSPoint(x: width - 80, y: height - 130))
    dividerColor.setStroke()
    divider.lineWidth = 1
    divider.stroke()

    // 1. Top Left URL
    let urlFont = NSFont.systemFont(ofSize: 28, weight: .black)
    let urlAttr: [NSAttributedString.Key: Any] = [
        .font: urlFont,
        .foregroundColor: NSColor.white,
        .kern: 1.2
    ]
    card.url.draw(at: NSPoint(x: 80, y: height - 100), withAttributes: urlAttr)

    // 2. Top Right Badges
    let badgeFont = NSFont.monospacedSystemFont(ofSize: 18, weight: .semibold)
    let badgeGreyAttr: [NSAttributedString.Key: Any] = [
        .font: badgeFont,
        .foregroundColor: NSColor(red: 148/255.0, green: 163/255.0, blue: 184/255.0, alpha: 1.0)
    ]
    let sepAttr: [NSAttributedString.Key: Any] = [
        .font: badgeFont,
        .foregroundColor: NSColor(red: 71/255.0, green: 85/255.0, blue: 105/255.0, alpha: 1.0)
    ]
    let accentColor = NSColor(red: card.colorR, green: card.colorG, blue: card.colorB, alpha: 1.0)
    let badgeAccentAttr: [NSAttributedString.Key: Any] = [
        .font: badgeFont,
        .foregroundColor: accentColor
    ]

    let rightString = NSMutableAttributedString(string: card.topRightGrey + "  ", attributes: badgeGreyAttr)
    rightString.append(NSAttributedString(string: "//  ", attributes: sepAttr))
    rightString.append(NSAttributedString(string: card.topRightAccent, attributes: badgeAccentAttr))
    let rightSize = rightString.size()
    rightString.draw(at: NSPoint(x: Double(width - 80) - rightSize.width, y: Double(height - 96)))

    // 3. Category Tag
    let catFont = NSFont.monospacedSystemFont(ofSize: 16, weight: .bold)
    let catAttr: [NSAttributedString.Key: Any] = [
        .font: catFont,
        .foregroundColor: accentColor,
        .kern: 2.0
    ]
    card.category.draw(at: NSPoint(x: 80, y: height - 235), withAttributes: catAttr)

    // 4. Headline
    let headFont = NSFont.systemFont(ofSize: 88, weight: .black)
    let headAttr: [NSAttributedString.Key: Any] = [
        .font: headFont,
        .foregroundColor: NSColor.white,
        .kern: -0.5
    ]
    card.headline.draw(at: NSPoint(x: 80, y: height - 345), withAttributes: headAttr)

    // 5. Description
    let descStyle = NSMutableParagraphStyle()
    descStyle.lineSpacing = 12
    let descFont = NSFont.systemFont(ofSize: 32, weight: .regular)
    let descAttr: [NSAttributedString.Key: Any] = [
        .font: descFont,
        .foregroundColor: NSColor(red: 203/255.0, green: 213/255.0, blue: 225/255.0, alpha: 1.0),
        .paragraphStyle: descStyle
    ]
    let descRect = NSRect(x: 80, y: height - 510, width: 1040, height: 140)
    card.description.draw(in: descRect, withAttributes: descAttr)

    NSGraphicsContext.restoreGraphicsState()

    if let pngData = rep.representation(using: .png, properties: [:]) {
        let fileURL = outputDir.appendingPathComponent("\(card.slug).png")
        try? pngData.write(to: fileURL)
        print("Generated \(fileURL.path) (\(pngData.count) bytes)")
    }
}

print("All 8 OG images generated successfully!")
