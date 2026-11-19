
import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function GET() {
  try {
    const items = await sql`
      SELECT id, name, price, description
      FROM menu_items
      ORDER BY id DESC
    `;

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET menu error:", error);

    return NextResponse.json(
      { error: "Could not load menu" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const price = Number(body.price);

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (
      !name ||
      name.length > 255 ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price > 99999999.99
    ) {
      return NextResponse.json(
        { error: "Valid name and price required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (${name}, ${price}, ${description})
      RETURNING id, name, price, description
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST menu error:", error);

    return NextResponse.json(
      { error: "Could not add dish" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("id"));

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid dish ID" },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM menu_items
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE menu error:", error);

    return NextResponse.json(
      { error: "Could not delete dish" },
      { status: 500 }
    );
  }
}
