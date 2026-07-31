/**
 * CrisisConnect — Hungarian Algorithm (Kuhn–Munkres)
 *
 * Solves the optimal assignment problem in O(n³) time.
 * Finds the assignment of n agents to n tasks that minimizes total cost.
 *
 * This is a pure TypeScript implementation with no external dependencies.
 * It is fully deterministic and produces globally optimal assignments.
 *
 * Input:  n×n cost matrix (square — pad with large values for rectangular inputs)
 * Output: assignment array where result[i] = j means agent i is assigned to task j
 *
 * Reference: Harold W. Kuhn, "The Hungarian Method for the Assignment Problem",
 *            Naval Research Logistics Quarterly, 1955.
 */

const INF = Number.POSITIVE_INFINITY;

/**
 * Runs the Hungarian Algorithm on a square cost matrix.
 *
 * @param costMatrix - Square n×n matrix of costs (must be square, use padding for rectangular)
 * @returns assignment array: assignment[volunteerIndex] = requestIndex
 */
export function hungarianAlgorithm(costMatrix: number[][]): number[] {
  const n = costMatrix.length;

  if (n === 0) return [];
  if (n === 1) return [0];

  // Deep-copy the matrix to avoid mutating the input
  const cost: number[][] = costMatrix.map((row) => [...row]);

  // u[i] = potential for row i, v[j] = potential for col j
  const u = new Array<number>(n + 1).fill(0);
  const v = new Array<number>(n + 1).fill(0);

  // p[j] = index of the row assigned to column j (1-indexed internally)
  const p = new Array<number>(n + 1).fill(0);

  // way[j] = which column led to column j in the shortest path
  const way = new Array<number>(n + 1).fill(0);

  // Main loop: process each row (1-indexed)
  for (let i = 1; i <= n; i++) {
    // p[0] = i means we are looking for an augmenting path starting from row i
    p[0] = i;
    let j0 = 0;

    const minVal = new Array<number>(n + 1).fill(INF);
    const used = new Array<boolean>(n + 1).fill(false);

    // Dijkstra-like shortest path search
    do {
      used[j0] = true;
      let delta = INF;
      let j1 = -1;

      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          // cost is 0-indexed; p[j0] is the row assigned to column j0 (1-indexed)
          const rowIdx = p[j0] - 1;
          const colIdx = j - 1;
          const cur = cost[rowIdx][colIdx] - u[p[j0]] - v[j];

          if (cur < minVal[j]) {
            minVal[j] = cur;
            way[j] = j0;
          }
          if (minVal[j] < delta) {
            delta = minVal[j];
            j1 = j;
          }
        }
      }

      // Update potentials
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minVal[j] -= delta;
        }
      }

      j0 = j1!;
    } while (p[j0] !== 0);

    // Augment along the path
    do {
      p[j0] = p[way[j0]];
      j0 = way[j0];
    } while (j0 !== 0);
  }

  // Extract the 0-indexed assignment array
  const assignment = new Array<number>(n).fill(-1);
  for (let j = 1; j <= n; j++) {
    if (p[j] !== 0) {
      assignment[p[j] - 1] = j - 1;
    }
  }

  return assignment;
}

/**
 * Calculates the total cost of a given assignment.
 *
 * @param costMatrix - The original cost matrix
 * @param assignment - The assignment array (assignment[i] = j)
 * @returns Total cost of the assignment
 */
export function calculateTotalCost(
  costMatrix: number[][],
  assignment: number[],
): number {
  return assignment.reduce((sum, j, i) => {
    if (j === -1 || j >= costMatrix[i].length) return sum;
    return sum + costMatrix[i][j];
  }, 0);
}

/**
 * Greedy nearest-neighbor baseline — used only for comparison in the demo.
 * NOT used for actual assignments.
 *
 * This simple O(n²) algorithm assigns each request to the closest available volunteer.
 * It is demonstrably suboptimal compared to the Hungarian Algorithm.
 *
 * @returns Greedy assignment array
 */
export function greedyAssignment(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  const assignment = new Array<number>(n).fill(-1);
  const usedColumns = new Set<number>();

  for (let i = 0; i < n; i++) {
    let minCost = INF;
    let bestJ = -1;

    for (let j = 0; j < costMatrix[i].length; j++) {
      if (!usedColumns.has(j) && costMatrix[i][j] < minCost) {
        minCost = costMatrix[i][j];
        bestJ = j;
      }
    }

    if (bestJ !== -1) {
      assignment[i] = bestJ;
      usedColumns.add(bestJ);
    }
  }

  return assignment;
}
