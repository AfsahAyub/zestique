
import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

// GET - Load all dishes
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

// Validate dish information
function validateDish(body) {
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
    return {
      error: "Please enter a valid dish name and price",
    };
  }

  return { name, price, description };
}

// POST - Add a new dish
export async function POST(request) {
  try {
    const body = await request.json();
    const dish = validateDish(body);

    if (dish.error) {
      return NextResponse.json(
        { error: dish.error },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (
        ${dish.name},
        ${dish.price},
        ${dish.description}
      )
      RETURNING id, name, price, description
    `;

    return NextResponse.json(result[0], {
      status: 201,
    });
  } catch (error) {
    console.error("POST menu error:", error);

    return NextResponse.json(
      { error: "Could not add dish" },
      { status: 500 }
    );
  }
}

// PATCH - Edit an existing dish
export async function PATCH(request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid dish ID" },
        { status: 400 }
      );
    }

    const dish = validateDish(body);

    if (dish.error) {
      return NextResponse.json(
        { error: dish.error },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE menu_items
      SET
        name = ${dish.name},
        price = ${dish.price},
        description = ${dish.description}
      WHERE id = ${id}
      RETURNING id, name, price, description
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PATCH menu error:", error);

    return NextResponse.json(
      { error: "Could not update dish" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a dish
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
