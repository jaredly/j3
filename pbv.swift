#!/usr/bin/env swift
import Cocoa
import Foundation

let newline = Data([0x0A] as [UInt8])

/**
 Write the given string to STDERR.

 - parameter str: native string to write encode in utf-8.
 - parameter appendNewline: whether or not to write a newline (U+000A) after the given string (defaults to true)
 */
func printErr(_ str: String, appendNewline: Bool = true) {
    // writing to STDERR takes a bit of boilerplate, compared to print()
    if let data = str.data(using: .utf8) {
        FileHandle.standardError.write(data)
        if appendNewline {
            FileHandle.standardError.write(newline)
        }
    }
}

/**
 Read Data from NSPasteboard.

 - parameter pasteboard: specific pasteboard to read from
 - parameter dataTypeName: name of pasteboard data type to read as

 - throws: `NSError` if data cannot be read as given dataType
 */
func pasteboardData(_ pasteboard: NSPasteboard, dataTypeName: String) throws -> Data {
    let dataType = NSPasteboard.PasteboardType(rawValue: dataTypeName)
    if let string = pasteboard.string(forType: dataType) {
        let data = string.data(using: .utf8)! // supposedly force-unwrapping using UTF-8 never fails
        return data
    }
    if let data = pasteboard.data(forType: dataType) {
        return data
    }
    throw NSError(
        domain: "pbv",
        code: 0,
        userInfo: [
            NSLocalizedDescriptionKey: "Could not access pasteboard contents as String or Data for type: '\(dataTypeName)'",
        ]
    )
}

/**
 Read Data from NSPasteboard, trying each dataType in turn.

 - parameter pasteboard: specific pasteboard to read from
 - parameter dataTypeNames: names of pasteboard data type to try reading as

 - throws: `NSError` if data cannot be read as _any_ of the given dataTypes
 */
func bestPasteboardData(_ pasteboard: NSPasteboard, dataTypeNames: [String]) throws -> Data {
    for dataTypeName in dataTypeNames {
        if let data = try? pasteboardData(pasteboard, dataTypeName: dataTypeName) {
            return data
        }
    }
    let dataTypeNamesJoined = dataTypeNames.map { "'\($0)'" }.joined(separator: ", ")
    throw NSError(
        domain: "pbv",
        code: 0,
        userInfo: [
            NSLocalizedDescriptionKey: "Could not access pasteboard contents as String or Data for types: \(dataTypeNamesJoined)",
        ]
    )
}

func streamBestPasteboardData(_ pasteboard: NSPasteboard, dataTypeNames: [String], timeInterval: TimeInterval = 0.1) -> Timer {
    var lastChangeCount = pasteboard.changeCount

    return Timer.scheduledTimer(withTimeInterval: timeInterval, repeats: true) { _ in
        let changeCount = pasteboard.changeCount
        if changeCount != lastChangeCount {
            printErr("#\(changeCount)")
            lastChangeCount = changeCount
            do {
                let data = try bestPasteboardData(pasteboard, dataTypeNames: dataTypeNames)
                FileHandle.standardOutput.write(data)
            } catch {
                printErr(error.localizedDescription)
            }
        }
    }
}

func printTypes(_ pasteboard: NSPasteboard) {
    printErr("Available types for the '\(pasteboard.name.rawValue)' pasteboard:")
    // Apple documentation says `types` "is an array NSString objects",
    // but that's wrong: they are PasteboardType structures.
    if let types = pasteboard.types {
        for type in types {
            printErr("  \(type.rawValue)")
        }
    } else {
        printErr("  (not available)")
    }
}

// CLI helpers

private func basename(_ pathOption: String?) -> String? {
    if let path = pathOption {
        return URL(fileURLWithPath: path).lastPathComponent
    }
    return nil
}

private func printUsage(_ pasteboard: NSPasteboard) {
    let process = basename(CommandLine.arguments.first) ?? "pbv"
    printErr("""
    Usage: \(process) [-h|--help]
           \(process) [dataType [dataType [...]]] [-s|--stream]

    Read contents of pasteboard as 'dataType'. If multiple types are specified,
    tries each from left to right, stopping at first success. If omitted,
    defaults to 'public.utf8-plain-text'.

    Options:
      -h|--help    Show this help and exit
      -s|--stream  Start an infinite loop polling the Pasteboard 'changeCount',
                   running as usual whenever it changes

    """)
    printTypes(pasteboard)
}

// CLI entry point

func main() {
    let pasteboard: NSPasteboard = .general

    // CommandLine.arguments[0] is the fullpath to this file
    // CommandLine.arguments[1+] should be the desired type(s)
    var args = Array(CommandLine.arguments.dropFirst())
    if args.contains("-h") || args.contains("--help") {
        printUsage(pasteboard)
        exit(0)
    }

    let streamIndex = args.firstIndex { arg in arg == "-s" || arg == "--stream" }
    if let index = streamIndex {
        args.remove(at: index)
    }

    let types = args.isEmpty ? ["public.utf8-plain-text"] : args
    if streamIndex != nil {
        let timer = streamBestPasteboardData(pasteboard, dataTypeNames: types)

        let runLoop = RunLoop.main
        runLoop.add(timer, forMode: .default)
        runLoop.run()
    } else {
        do {
            let data = try bestPasteboardData(pasteboard, dataTypeNames: types)
            FileHandle.standardOutput.write(data)
            exit(0)
        } catch {
            printErr(error.localizedDescription)
            printTypes(pasteboard)
            exit(1)
        }
    }
}

main()